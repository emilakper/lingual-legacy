# Lingual Legacy - Платформа онлайн-обучения языковых курсов.

## Оглавление

1. [Описание](#описание)
2. [Технологии](#технологии)
3. [Начало работы (localhost)](#начало-работы-localhost)
4. [База данных](#база-данных)
5. [Хостинг в облачном сервисе (Yandex Cloud)](#хостинг-в-облачном-сервисе-yandex-cloud)
    - [Предварительные требования](#предварительные-требования)
    - [Настройка Terraform](#настройка-terraform)
    - [Настройка Ansible](#настройка-ansible)
    - [Заключение](#заключение)
6. [Лицензия](#лицензия)
7. [Важно](#важно)

## Описание:

Этот репозиторий содержит код для Lingual Legacy, платформы онлайн-обучения, которая помогает пользователям изучать языки. Включает в себя административную панель, с помощью которой можно редактировать курсы, уроки, создания, а также управлять пользователями.

![pic](https://github.com/user-attachments/assets/d8096d0b-7182-421e-b6a7-6a580ea67eb7)

![admin1](https://github.com/user-attachments/assets/a8b8a1bc-8f5a-4a5b-8fdf-8207bb033b36)

![admin2](https://github.com/user-attachments/assets/487ec950-23cb-49db-bd2c-32451f48b103)




## Технологии:

Фронтенд: React, Tailwind CSS

Бэкенд: Go (Gin)

База данных: PostgreSQL

Аутентификация: JWT

Деплой: Terraform, Ansible, Docker

## Начало работы (localhost):

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

5. **Запустите сервер бэкенда (после запуска БД PostgreSQL согласно инструкции ниже):**
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

## База данных (localhost):

Создайте базу данных PostgreSQL с именем, указанным в переменной окружения `DB_NAME`.
Создайте пользователя с именем и паролем, указанными в переменных окружения `DB_USER` и `DB_PASSWORD`.

## Хостинг в облачном сервисе (Yandex Cloud):

### Предварительные требования

1. **Регистрация и настройка Yandex Cloud:**
   - Зарегистрируйтесь в [Yandex Cloud](https://yandex.cloud/ru/).
   - Создайте новый каталог в консоли управления.
   - Создайте сервисный аккаунт и получите IAM-токен для доступа к Yandex Cloud, следуя [инструкции](https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa).

2. **Установка утилит:**
   - Установите Terraform для управления инфраструктурой.
   - Установите Ansible для конфигурирования серверов.
   - Установите Docker для контейнеризации приложений.

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
   - Перейдите в каталог `deploy-config/terraform` с Terraform файлами.
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

### Настройка Ansible

1. **Создание файла `all.yml` в директории `ansible/vars`:**
   - Перейдите в директорию `deploy-conf/ansible/vars`.
   - Создайте/отредактируйте файл `all.yml` и заполните его необходимыми параметрами. Пример содержимого файла:

     ```yaml
     ---
      db_user: 'lingua_legacy_user' # Можно сменить
      db_password: 1234 # Можно сменить
      db_name: 'lingua_legacy' # Можно сменить
      jwt_secret: 'my-short-and-simple-secret' # Можно сменить
      db_host: "{{ hostvars['ling-db']['ansible_host'] }}" # не изменяйте!
      backend_host: "{{ hostvars['ling-back']['ansible_host'] }}" # Не изменяйте
      admin_email: "startadmin@main.com" # Можно сменить, обязательно в виде почты(валидация почты не реализована, так что не обязательно существующей)
      admin_password_hash: "$2a$10$ngHo5lsHDF68zRnI.X/jmepcoV.ulJI9Ig7ZzP.y53/PGCoq4al8S" # Можно сменить
     ```

     **Важно:** Не забудьте сгенерировать хеш пароля для администратора с помощью [bcrypt-generator.com](https://bcrypt-generator.com/).

2. **Предупреждение о безопасности:**
   - **Внимание:** Никогда не добавляйте файлы `hosts` и `all.yml` в публичный репозиторий, так как в них хранятся важные для безопасности данные. В данном репозитории они лежат намеренно, так как данная конфигурация не запущена и потому недоступна, они лежат лишь для примера.

3. **Запуск Ansible:**
   - Находясь в директории `ansible`, выполните команду для запуска плейбука:
     ```sh
     ansible-playbook -i inventory setup.yml
     ```

   Убедитесь, что файл `hosts` содержит правильные IP-адреса и SSH-ключи для доступа к созданным виртуальным машинам.

   Если нужно вводить passphrase для использования SSH-ключа, можно добавить его в ssh-agent в текущей сессии. 

### Заключение

Теперь ваша инфраструктура в Yandex Cloud настроена и готова к использованию. Убедитесь, что все конфиденциальные данные хранятся безопасно и не передаются в публичные репозитории.

## Лицензия:

Этот проект лицензирован по лицензии GPL.

## Важно:

- Убедитесь, что вы установили переменные окружения в файле `.env`.

Замените `<YOUR_DB_USER>`, `<YOUR_DB_PASSWORD>`, `<YOUR_DB_NAME>`, `DB_HOST`, `ALLOWED_ORIGINS` и `<YOUR_JWT_SECRET>` на ваши фактические значения.

Никогда не добавляйте файл `.env` в публичный репозиторий!

- Убедитесь, что вы указали все необходимые переменные в файле `terraform.tfvars`, включая `yandex_token`, `yandex_cloud_id`, `yandex_folder_id`, и `yandex_zone`.

Никогда не добавляйте файл `terraform.tfvars` в публичный репозиторий, так как он содержит конфиденциальные данные для доступа к облаку!

- Убедитесь, что вы указали все необходимые переменные в файле `all.yml`.

Никогда не добавляйте файл `all.yml` и `hosts` в публичный репозиторий, так как он содержит конфиденциальные данные для доступа к облаку!
