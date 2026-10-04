resource "aws_ecr_repository" "app" {
  for_each = toset(["codearena-app", "codearena-web"])
  name = "${var.project_name}/${each.key}"
  image_scanning_configuration { scan_on_push = true }
  image_tag_mutability = "MUTABLE"
}
resource "aws_ecr_lifecycle_policy" "app" {
  for_each = aws_ecr_repository.app
  repository = each.value.name
  policy = jsonencode({ rules = [{ rulePriority = 1, description = "Keep last 20 images", selection = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 20 }, action = { type = "expire" } }] })
}
