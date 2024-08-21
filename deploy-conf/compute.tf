resource "yandex_compute_instance" "vm" {
  for_each = toset(["ling-back", "ling-front", "ling-adm", "ling-db"])

  name = each.key

  resources {
    cores  = var.vm_cores[each.key]
    memory = var.vm_memory[each.key]
  }

  boot_disk {
    disk_id = yandex_compute_disk.boot-disk[each.key].id
  }

  network_interface {
    subnet_id = yandex_vpc_subnet.subnet-1.id
    nat       = true
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
  }
}