FROM golang:1.17-alpine

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main ./cmd/main.go

ENV DB_PASSWORD=1234
ENV DB_USER=lingua_legacy_user
ENV DB_NAME=lingua_legacy
ENV DB_HOST=localhost
ENV JWT_SECRET=my-short-and-simple-secret

EXPOSE 8081

CMD ["./main"]