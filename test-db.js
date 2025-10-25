
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
