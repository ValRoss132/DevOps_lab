locals { 
    bucket_name = "tf-devops-bucket" // Определяем локальную переменную для имени бакета
}

// Создание сервисного аккаунта 
resource "yandex_iam_service_account" "sa" {
  folder_id = local.folder_id // ID папки, в которой будет создан сервисный аккаунт
  name      = "tf-test-sa" // Имя сервисного аккаунта
}

// Предоставление прав
resource "yandex_resourcemanager_folder_iam_member" "sa-editor" {
  folder_id = local.folder_id // ID папки, где будет применяться роль
  role      = "storage.editor" // Назначаем роль 'editor' для работы с хранилищем
  member    = "serviceAccount:${yandex_iam_service_account.sa.id}" // Аккаунт для назначения роли
}

// Создание статического ключа
resource "yandex_iam_service_account_static_access_key" "sa-static-key" {
  service_account_id = yandex_iam_service_account.sa.id // ID сервисного аккаунта
  description        = "static access key for object storage" // Описание ключа
}

// Создание хранилища
resource "yandex_storage_bucket" "test" {
  access_key = yandex_iam_service_account_static_access_key.sa-static-key.access_key // Ключ доступа для аутентификации
  secret_key = yandex_iam_service_account_static_access_key.sa-static-key.secret_key // Секретный ключ
  bucket     = local.bucket_name // Имя бакета
}

// Создание ВМ
resource "yandex_compute_instance" "docker_vm" {
  name        = "docker-vm" // Имя ВМ
  platform_id = "standard-v1" // Тип платформы
  zone        = "ru-central1-a" // Зона размещение (регион)

  resources {
    cores  = 2 // Количество виртуальных ядер 
    memory = 2 // Объем ОП
  }

  boot_disk {
    initialize_params {
      image_id = "fd8vfvc6r3tl3k0igv6l" // ID образа для создания диска
    }
  }

  network_interface {
    subnet_id = yandex_vpc_subnet.default.id // ID подсети для подключения ВМ
    nat       = true // Nat для выхода ВМ в интернет
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}" // SSH-ключ для доступа к виртуальной машине

    # Скрипт установки Docker при создании ВМ
    user-data = <<-EOT
      #cloud-config
      packages:
        - docker.io
      runcmd:
        - systemctl enable docker
        - systemctl start docker
    EOT
  }
}

// Создание сети и подсети для ВМ
resource "yandex_vpc_network" "default" {
  name = "default-network" // Имя сети
}

// Подсеть 
resource "yandex_vpc_subnet" "default" {
  name           = "default-subnet" // Имя подсети 
  zone           = "ru-central1-a" // Зона размещения 
  network_id     = yandex_vpc_network.default.id // Ссылка на сеть, к которой будет привязана подсеть
  v4_cidr_blocks = ["10.0.0.0/24"] // Диапазон IP-адресов для подсети
}