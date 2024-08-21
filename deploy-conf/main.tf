data "template_file" "ansible_hosts" {
  template = file("./hosts.cfg")

  vars = {
    ips = join("\n", [for k, v in yandex_compute_instance.vm : "${v.network_interface.0.nat_ip_address} ansible_user=ubuntu"])
  }
}

resource "null_resource" "generate_ansible_hosts" {
  triggers = {
    template_rendered = data.template_file.ansible_hosts.rendered
  }

  provisioner "local-exec" {
    command = "echo '${data.template_file.ansible_hosts.rendered}' > hosts"
  }
}