variable "yandex_token" {
  description = "Yandex Cloud API token"
  sensitive   = true
}

variable "yandex_cloud_id" {
  description = "Yandex Cloud ID"
}

variable "yandex_folder_id" {
  description = "Yandex Folder ID"
}

variable "yandex_zone" {
  description = "Yandex Zone"
}

variable "disk_size" {
  description = "Size of the disk in GB"
  default     = 20
}

variable "disk_image_id" {
  description = "Image ID for the disk"
  default     = "fd8e39esofgaddnc174k"
}

variable "vm_cores" {
  description = "Number of CPU cores for the VM"
  type        = map(number)
  default = {
    ling-back  = 2
    ling-front = 2
    ling-adm   = 2
    ling-db    = 2
  }
}

variable "vm_memory" {
  description = "Amount of memory for the VM in GB"
  type        = map(number)
  default = {
    ling-back  = 2
    ling-front = 2
    ling-adm   = 2
    ling-db    = 4
  }
}