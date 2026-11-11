import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { analyze as analyzePlagiarism } from '../server/plagiarism.mjs';

test('AST Winnowing plagiarism algorithm catches variable renaming and comment evasion', () => {
  const codeA = `
def calculate_fibonacci(limit):
    results = []
    a, b = 0, 1
    while a < limit:
        results.append(a)
        a, b = b, a + b
    return results
`;

  const codeB = `
# Evaded cloned solution with modified identifier names
def compute_fib(max_val):
    output_list = []
    first, second = 0, 1
    while first < max_val:
        output_list.append(first)
        first, second = second, first + second
    return output_list
`;

  const analysis = analyzePlagiarism(codeA, codeB);
  assert.ok(analysis.score >= 50, `Plagiarism score must be >= 50, got ${analysis.score}`);
  assert.ok(analysis.tokensA > 0);
  assert.ok(analysis.tokensB > 0);
  assert.ok(analysis.winnowingHashMatchCount > 0, 'Winnowing hash matches must be detected');
});

test('Automated submission plagiarism hook flags matching submissions in database', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      problem_id TEXT,
      source_code TEXT,
      verdict TEXT,
      plagiarism_score REAL DEFAULT 0,
      created_at TEXT
    );
    CREATE TABLE plagiarism_reviews (
      id TEXT PRIMARY KEY,
      submission_id TEXT,
      compared_submission_id TEXT,
      similarity REAL,
      evidence_json TEXT,
      status TEXT DEFAULT 'PENDING',
      reviewed_by TEXT,
      reviewed_at TEXT
    );
  `);

  const codeA = `
def solve(n):
    total = 0
    for i in range(n):
        if i % 2 == 0:
            total += i * 2
    return total
`;

  const codeB = `
# Student B submission
def compute(count):
    res = 0
    for k in range(count):
        if k % 2 == 0:
            res += k * 2
    return res
`;

  const now = new Date().toISOString();
  // Existing submission from student 1
  db.prepare('INSERT INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'sub-01', 'student-01', 'prob_101', codeA, 'ACCEPTED', 0, now
  );

  // New incoming submission from student 2
  db.prepare('INSERT INTO submissions VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'sub-02', 'student-02', 'prob_101', codeB, 'ACCEPTED', 0, now
  );

  // Run automated audit logic
  const sub = db.prepare('SELECT * FROM submissions WHERE id=?').get('sub-02');
  const peers = db.prepare("SELECT * FROM submissions WHERE problem_id=? AND user_id!=? AND verdict='ACCEPTED'").all(sub.problem_id, sub.user_id);
  
  let flagged = false;
  for (const peer of peers) {
    const analysis = analyzePlagiarism(sub.source_code, peer.source_code);
    if (analysis.score >= 50) {
      flagged = true;
      const reviewId = randomUUID();
      db.prepare("INSERT INTO plagiarism_reviews (id, submission_id, compared_submission_id, similarity, evidence_json, status) VALUES (?, ?, ?, ?, ?, 'FLAGGED')").run(
        reviewId, sub.id, peer.id, analysis.score, JSON.stringify({
          hashMatches: analysis.winnowingHashMatchCount,
          tokensA: analysis.tokensA,
          tokensB: analysis.tokensB,
          trigger: 'automated-submission-hook'
        })
      );
      db.prepare('UPDATE submissions SET plagiarism_score=? WHERE id=?').run(analysis.score, sub.id);
      db.prepare('UPDATE submissions SET plagiarism_score=? WHERE id=?').run(analysis.score, peer.id);
    }
  }

  assert.equal(flagged, true, 'Submissions with identical structural AST should be flagged');

  // Verify review inserted
  const review = db.prepare('SELECT * FROM plagiarism_reviews WHERE submission_id=?').get('sub-02');
  assert.ok(review, 'Plagiarism review record must exist');
  assert.equal(review.status, 'FLAGGED');
  assert.equal(review.compared_submission_id, 'sub-01');
  assert.ok(review.similarity >= 50);

  // Verify scores updated
  const updatedSub2 = db.prepare('SELECT plagiarism_score FROM submissions WHERE id=?').get('sub-02');
  assert.ok(updatedSub2.plagiarism_score >= 50);
});
