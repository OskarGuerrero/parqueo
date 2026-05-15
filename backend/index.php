<?php

// Conexión a la base de datos SQLite
$db = new SQLite3('parqueo.db');

// Configurar cabeceras para la API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Obtener la ruta solicitada
$request = $_SERVER['REQUEST_URI'];

// Rutas disponibles
if (strpos($request, '/api/login') === 0) {
    // Lógica para login
    $data = json_decode(file_get_contents('php://input'), true);
    $usuario = $data['usuario'] ?? '';
    $clave = $data['clave'] ?? '';

    $stmt = $db->prepare('SELECT * FROM usuarios WHERE usuario = ? AND clave = ?');
    $stmt->bindValue(1, $usuario, SQLITE3_TEXT);
    $stmt->bindValue(2, $clave, SQLITE3_TEXT);
    $result = $stmt->execute();

    if ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        echo json_encode(['success' => true, 'usuario' => $row['usuario'], 'rol' => $row['rol']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas']);
    }
} elseif (strpos($request, '/api/entrada') === 0) {
    // Lógica para registrar entrada
    $data = json_decode(file_get_contents('php://input'), true);
    $placa = $data['placa'] ?? '';

    $stmt = $db->prepare('INSERT INTO tickets (id, placa, estado) VALUES (?, ?, ?)');
    $stmt->bindValue(1, uniqid(), SQLITE3_TEXT);
    $stmt->bindValue(2, $placa, SQLITE3_TEXT);
    $stmt->bindValue(3, 'activo', SQLITE3_TEXT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Entrada registrada']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al registrar entrada']);
    }
} elseif (strpos($request, '/api/salida') === 0) {
    // Lógica para registrar salida
    $data = json_decode(file_get_contents('php://input'), true);
    $placa = $data['placa'] ?? '';

    $stmt = $db->prepare('UPDATE tickets SET estado = ?, salida = CURRENT_TIMESTAMP WHERE placa = ? AND estado = ?');
    $stmt->bindValue(1, 'completado', SQLITE3_TEXT);
    $stmt->bindValue(2, $placa, SQLITE3_TEXT);
    $stmt->bindValue(3, 'activo', SQLITE3_TEXT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Salida registrada']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al registrar salida']);
    }
} elseif (strpos($request, '/api/configuracion') === 0) {
    // Lógica para configuración
    $result = $db->query('SELECT * FROM configuracion');
    $config = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $config[$row['clave']] = $row['valor'];
    }
    echo json_encode(['success' => true, 'configuracion' => $config]);
} else {
    // Ruta no encontrada
    http_response_code(404);
    echo json_encode(['error' => 'Ruta no encontrada']);
}

?>