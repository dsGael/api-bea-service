import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

@Injectable()
export class DriveService {
  private readonly drive;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      //keyFile: './bea-service-api-787b5aa0bb11.json',
      keyFile: path.join(process.cwd(), 'bea-service-api-787b5aa0bb11.json'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    this.drive = google.drive({ version: 'v3', auth });
  }

  // NUEVO MÉTODO: Busca la subcarpeta por nombre o la crea
  async obtenerOCrearCarpeta(nombreCarpeta: string, idPadre: string): Promise<string> {
    try {
      // 1. Buscamos si ya existe una carpeta con ese nombre dentro del padre
      const query = `mimeType='application/vnd.google-apps.folder' and name='${nombreCarpeta}' and '${idPadre}' in parents and trashed=false`;
      
      const respuesta = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
      });

      // Si existe, devolvemos su ID inmediatamente
      if (respuesta.data.files && respuesta.data.files.length > 0) {
        return respuesta.data.files[0].id;
      }

      // 2. Si no existe, procedemos a crearla
      const metadataCarpeta = {
        name: nombreCarpeta,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [idPadre],
      };

      const nuevaCarpeta = await this.drive.files.create({
        requestBody: metadataCarpeta,
        fields: 'id',
      });

      // Hacemos que esta nueva carpeta sea de lectura pública (opcional, pero útil)
      await this.drive.permissions.create({
        fileId: nuevaCarpeta.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      return nuevaCarpeta.data.id;
    } catch (error) {
      console.error('Error al crear subcarpeta:', error);
      throw new InternalServerErrorException('No se pudo crear la subcarpeta en Drive');
    }
  }

  // MÉTODO ACTUALIZADO: Ahora recibe el ID de la subcarpeta destino
  async subirArchivo(file: Express.Multer.File, idCarpetaDestino: string): Promise<string> {
    const stream = Readable.from(file.buffer);
    
    const driveFile = await this.drive.files.create({
      requestBody: {
        name: `${file.originalname}-${Date.now()}`,
        parents: [idCarpetaDestino], 
      },
      media: { mimeType: file.mimetype, body: stream },
      fields: 'id, webViewLink',
    });

    // Nota: Si hiciste pública la carpeta padre, los archivos heredan ese permiso automáticamente
    return driveFile.data.webViewLink;
  }

  // MÉTODO ACTUALIZADO: Para subir varias a la vez a la subcarpeta que quieras
  async subirMultiplesArchivos(files: Array<Express.Multer.File>, nombreSubcarpeta: string): Promise<string[]> {
    const carpetaRaizId = process.env.GOOGLE_DRIVE_FOLDER_ID; // La carpeta maestra (ej. "Sistema BEA")
    if (!carpetaRaizId) {
      throw new InternalServerErrorException('GOOGLE_DRIVE_FOLDER_ID no está configurado');
    }
    
    // Primero, obtenemos (o creamos) la subcarpeta
    const idSubcarpeta = await this.obtenerOCrearCarpeta(nombreSubcarpeta, carpetaRaizId);

    // Luego, subimos todas las fotos a ese nuevo ID
    const promesas = files.map(file => this.subirArchivo(file, idSubcarpeta));
    
    return Promise.all(promesas);
  }
}