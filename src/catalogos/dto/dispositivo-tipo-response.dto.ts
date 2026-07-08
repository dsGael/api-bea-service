export class DispositivoTipoResponseDto {
  id!: string;
  nombre!: string | null;
  descripcion!: string | null;
  tipo!: string | null;
  creadoPor!: string | null;
  fechaCreacion!: Date | null;
  modificadoPor!: string | null;
  fechaModificacion!: Date | null;
  requiereSerie!: boolean | null;

  static fromPrisma(dt: any): DispositivoTipoResponseDto {
    return {
      id: dt.idDispositivoT,
      nombre: dt.nombre,
      descripcion: dt.descripcion,
      tipo: dt.tipo,
      creadoPor: dt.creadoPor,
      fechaCreacion: dt.fechaCreacion,
      modificadoPor: dt.modificadoPor,
      fechaModificacion: dt.fechaModificacion,
      requiereSerie: dt.requiereSerie,
    };
  }
}