export interface LanguageDefinition {
  id: number | null; // null for browser-sandboxed HTML/CSS
  key: string;
  label: string;
  judge0LanguageId?: number;
  monacoLanguage: string;
  fileExtension: string;
  isWebSandbox?: boolean;
  defaultBoilerplate: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageDefinition> = {
  python: {
    id: 71,
    key: 'python',
    label: 'Python 3.12',
    judge0LanguageId: 71,
    monacoLanguage: 'python',
    fileExtension: 'py',
    defaultBoilerplate: `import sys

def main():
    # Read standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello from Chanakya University CodeArena!")
        return
    print(f"Processed {len(input_data)} tokens.")

if __name__ == "__main__":
    main()
`
  },
  java: {
    id: 62,
    key: 'java',
    label: 'Java 21',
    judge0LanguageId: 62,
    monacoLanguage: 'java',
    fileExtension: 'java',
    defaultBoilerplate: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Hello, UniSphere Java 21 Sandbox!");
        if (scanner.hasNextLine()) {
            System.out.println("Input: " + scanner.nextLine());
        }
    }
}
`
  },
  c: {
    id: 50,
    key: 'c',
    label: 'C (C17)',
    judge0LanguageId: 50,
    monacoLanguage: 'c',
    fileExtension: 'c',
    defaultBoilerplate: `#include <stdio.h>

int main(void) {
    printf("CodeArena C17 Engine Active\\n");
    return 0;
}
`
  },
  cpp: {
    id: 54,
    key: 'cpp',
    label: 'C++ 20',
    judge0LanguageId: 54,
    monacoLanguage: 'cpp',
    fileExtension: 'cpp',
    defaultBoilerplate: `#include <iostream>
#include <vector>

int main() {
    std::cout << "UniSphere Modern C++ 20 Sandbox\\n";
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    for (int n : numbers) {
        if (n % 2 == 0) {
            std::cout << "Even: " << n << "\\n";
        }
    }
    return 0;
}
`
  },
  javascript: {
    id: 63,
    key: 'javascript',
    label: 'JavaScript (Node.js 20)',
    judge0LanguageId: 63,
    monacoLanguage: 'javascript',
    fileExtension: 'js',
    defaultBoilerplate: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    console.log("UniSphere Node.js 20 Sandbox Output:");
    console.log(input ? input : "Ready.");
}

solve();
`
  },
  php: {
    id: 68,
    key: 'php',
    label: 'PHP 8.3',
    judge0LanguageId: 68,
    monacoLanguage: 'php',
    fileExtension: 'php',
    defaultBoilerplate: `<?php
echo "PHP 8.3 Lab Sandbox\\n";
$input = trim(fgets(STDIN));
if (!empty($input)) {
    echo "Echoed Input: " . $input . "\\n";
}
`
  },
  r: {
    id: 80,
    key: 'r',
    label: 'R',
    judge0LanguageId: 80,
    monacoLanguage: 'r',
    fileExtension: 'r',
    defaultBoilerplate: `data <- c(12, 15, 18, 24, 30)
cat("UniSphere R Statistical Engine\\n")
cat("Mean:", mean(data), "\\n")
`
  },
  sql: {
    id: 82,
    key: 'sql',
    label: 'SQL / SQLite',
    judge0LanguageId: 82,
    monacoLanguage: 'sql',
    fileExtension: 'sql',
    defaultBoilerplate: `-- SQLite 3 In-Memory Execution
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    usn TEXT NOT NULL,
    name TEXT NOT NULL,
    score INTEGER
);

INSERT INTO students (usn, name, score) VALUES 
('1CU23CS001', 'Arjun Kumar', 94),
('1CU23CS002', 'Bhavana Rao', 98);

SELECT * FROM students WHERE score >= 90;
`
  },
  html: {
    id: null,
    key: 'html',
    label: 'HTML / CSS',
    isWebSandbox: true,
    monacoLanguage: 'html',
    fileExtension: 'html',
    defaultBoilerplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: grid;
      place-items: center;
      height: 90vh;
      margin: 0;
      background: #0f172a;
      color: #f8fafc;
    }
    .card {
      padding: 2rem;
      border-radius: 12px;
      background: #1e293b;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #334155;
      text-align: center;
    }
    h1 { color: #38bdf8; margin-top: 0; }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <h1>UniSphere Lab Station</h1>
    <p>HTML & CSS Live Sandbox Render</p>
    <button onclick="alert('Client JS executed in isolated sandbox')">Interactive Test</button>
  </div>
</body>
</html>`
  }
};
