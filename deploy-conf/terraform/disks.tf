resource "yandex_compute_disk" "boot-disk" {
  for_each = toset(["ling-back", "ling-front", "ling-adm", "ling-db"])

  name     = "boot-disk-${each.key}"
  type     = "network-hdd"
  zone     = var.yandex_zone
  size     = var.disk_size
  image_id = var.disk_image_id
}