output "internal_ip_address" {
  value = {
    for k, v in yandex_compute_instance.vm : k => v.network_interface.0.ip_address
  }
}

output "external_ip_address" {
  value = {
    for k, v in yandex_compute_instance.vm : k => v.network_interface.0.nat_ip_address
  }
}