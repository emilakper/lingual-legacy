# Lingual Legacy - Платформа онлайн-обучения языковых курсов.

## Описание:

Этот репозиторий содержит код для Lingual Legacy, платформы онлайн-обучения, которая помогает пользователям изучать языки. 

![pic](https://github.com/user-attachments/assets/d8096d0b-7182-421e-b6a7-6a580ea67eb7)


## Технологии:

Фронтенд: React, Tailwind CSS

Бэкенд: Go (Gin)

База данных: PostgreSQL

Аутентификация: JWT

## Начало работы:

1. **Клонируйте этот репозиторий:**
   ```
   git clone https://github.com/your-username/lingual-legacy.git
   ```

2. **Перейдите в каталог бэкенда:**
   ```
   cd backend
   ```

3. **Создайте файл `.env` из `.env.example` и установите переменные окружения:**
   ```
   cp .env.example .env
   ```
   Установите следующие переменные окружения в `.env`:

   ```
   DB_PASSWORD=<YOUR_PASSWORD>
   JWT_SECRET=<YOUR_SECRET>
   ```

4. **Установите зависимости:**
   ```
   go mod tidy
   ```

5. **Запустите сервер бэкенда:**
   ```
   go run cmd/main.go
   ```

6. **Перейдите в каталог фронтенда:**
   ```
   cd frontend
   ```

7. **Установите зависимости:**
   ```
   npm install
   ```

8. **Запустите сервер разработки:**
   ```
   npm start
   ```   

## База данных:

Создайте базу данных PostgreSQL с именем lingual_legacy.
Создайте пользователя с таким же именем, как и база данных, и установите пароль с помощью переменной окружения DB_PASSWORD.

## Хостинг:

В данный момент проект работает локально.

## Лицензия:

Этот проект лицензирован по лицензии GPL.

## Важно:

Убедитесь, что вы установили переменные окружения в файле .env.

Замените password и hehe на ваш фактический пароль базы данных и секретный ключ JWT.

Никогда не добавляйте файл .env в репозиторий!
