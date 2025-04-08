# Day 1

1. `go mod tidy`
2. `docker-compose up -d`
3. `go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`
   - Install the db lib
4. `migrate -path ./migrations -database "postgresql://postgres:postgres@localhost:5432/gateway?sslmode=disable" up`
5. `clear && go run .\cmd\app\main.go`
6. `docker-compose down`
