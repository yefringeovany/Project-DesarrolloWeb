import sql from 'mssql';

const config = {
  user: 'db_abfceb_proyectoweb_admin',   // tu usuario
  password: '@mora)45',                 // tu contraseña
  server: 'SQL5112.site4now.net',        // servidor remoto
  database: 'db_abfceb_proyectoweb',     // nombre de tu base de datos
  port: 1433,
  options: {
    encrypt: true,               // requerido por SmarterASP.NET
    trustServerCertificate: true // necesario si hay certificado autofirmado
  }
};

async function testConnection() {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Conexión exitosa a SQL Server en SmarterASP.NET");

    // Ejecuta una consulta de prueba
    const result = await pool.request().query("SELECT TOP 3 name FROM sys.tables");
    console.log("📊 Tablas encontradas:", result.recordset);

    await pool.close();
  } catch (err) {
    console.error("❌ Error al conectar:", err.message);
  }
}

testConnection();
