terraform {
  required_providers {
    yandex = {
      source = "yandex-cloud/yandex"
      version = "0.140.1"
    }
  }
}

locals {
    cloud_id = "b1g3kjh74ff1tk33aut3"
    folder_id = "b1gvpeq1mhips42oaa0t"
}

provider "yandex" {
    cloud_id = local.cloud_id
    folder_id = local.folder_id
    service_account_key_file = "../terraform-key.json"
}