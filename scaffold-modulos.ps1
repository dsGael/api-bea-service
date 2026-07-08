$modulos = @("catalogos", "tickets", "refacciones", "almacen", "checador", "tecnicos", "chat", "envios", "gastos", "nomina")

foreach ($m in $modulos) {
    nest g module $m --no-spec
    nest g controller $m --no-spec
    nest g service $m --no-spec
    New-Item -ItemType Directory -Force -Path "src/$m/dto" | Out-Null
}