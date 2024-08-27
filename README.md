# Lingual Legacy - Платформа онлайн-обучения языковых курсов.

## Описание:

Этот репозиторий содержит код для Lingual Legacy, платформы онлайн-обучения, которая помогает пользователям изучать языки. Включает в себя административную панель, с помощью которой можно редактировать курсы, уроки, создания, а также управлять пользователями.

![pic](https://github.com/user-attachments/assets/d8096d0b-7182-421e-b6a7-6a580ea67eb7)


## Технологии:

Фронтенд: React, Tailwind CSS

Бэкенд: Go (Gin)

База данных: PostgreSQL

Аутентификация: JWT

## Начало работы:

1. **Клонируйте этот репозиторий:**
   ```
   git clone https://github.com/emilakper/lingual-legacy.git
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
   DB_USER=<YOUR_DB_USER>
   DB_NAME=<YOUR_DB_NAME>
   DB_HOST=<YOUR_DB_HOST_ADDRESS>
   JWT_SECRET=<YOUR_SECRET>
   ALLOWED_ORIGINS="<YOUR_FRONTEND_URL>"
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

Административная панель хостится как отдельное приложение, потому для нее шаги 6-8 повторяются, но с папкой `admin-panel`

## База данных:

Создайте базу данных PostgreSQL с именем, указанным в переменной окружения `DB_NAME`.
Создайте пользователя с именем и паролем, указанными в переменных окружения `DB_USER` и `DB_PASSWORD`.

## Хостинг в облачном сервисе (Yandex Cloud) (еще в разработке):

### Предварительные требования

1. **Регистрация и настройка Yandex Cloud:**
   - Зарегистрируйтесь в [Yandex Cloud](https://yandex.cloud/ru/).
   - Создайте новый каталог в консоли управления.
   - Создайте сервисный аккаунт и получите IAM-токен для доступа к Yandex Cloud, следуя [инструкции](https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa).

2. **Установка Terraform:**
   - Установите Terraform для управления инфраструктурой.

3. **Создание пары SSH-ключей:**
   - - Откройте терминал и выполните команду:
     ```sh
     ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
     ```
   - Следуйте инструкциям для создания ключа. Оставьте директорию по умолчанию, в которой будет создан файл `id_rsa` и `id_rsa.pub` в директории `~/.ssh/`.

### Настройка Terraform

1. **Создайте файл `terraform.tfvars` по шаблону `terraform.tfvars.example`, например:**

   ```hcl
   yandex_token    = "t1.gGwgowjg..."
   yandex_cloud_id = "b1ggggg..."
   yandex_folder_id = "b1ffff..."
   yandex_zone     = "ru-central1-b"

   disk_size       = 35
   disk_image_id   = "fd8e..."

   vm_cores = {
     ling-back  = 4
     ling-front = 4
     ling-adm   = 4
     ling-db    = 4
   }

   vm_memory = {
     ling-back  = 16
     ling-front = 16
     ling-adm   = 16
     ling-db    = 16
   }
   ```

   Обязательны к заполнению только переменные касательно Yandex Cloud.

   ### Настройка Terraform

1. **Инициализация Terraform:**
   - Перейдите в каталог `deploy-config` с Terraform файлами.
   - Выполните команду:
     ```sh
     terraform init
     ```

2. **Применение конфигурации Terraform:**
   - Проверьте план выполнения:
     ```sh
     terraform plan
     ```
   - Примените конфигурацию:
     ```sh
     terraform apply
     ```

   После успешного выполнения команды `terraform apply`, в консоль будут выведены IP-адреса созданных виртуальных машин, к которым можно будет подключиться по SSH. Также будет создан файл `hosts` для дальнейшей конфигурации с помощью Ansible. Желательно использовать образы с Ubuntu, так как именно под эту ОС будет адаптирована автоматический деплой в облако.

## Лицензия:

Этот проект лицензирован по лицензии GPL.

## Важно:

- Убедитесь, что вы установили переменные окружения в файле `.env`.

Замените `<YOUR_DB_USER>`, `<YOUR_DB_PASSWORD>`, `<YOUR_DB_NAME>`, `DB_HOST`, `ALLOWED_ORIGINS` и `<YOUR_JWT_SECRET>` на ваши фактические значения.

Никогда не добавляйте файл `.env` в репозиторий!

- Убедитесь, что вы указали все необходимые переменные в файле `terraform.tfvars`, включая `yandex_token`, `yandex_cloud_id`, `yandex_folder_id`, и `yandex_zone`.

Никогда не добавляйте файл `terraform.tfvars` в репозиторий, так как он содержит конфиденциальные данные для доступа к облаку!
