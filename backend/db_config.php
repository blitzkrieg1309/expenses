<?php

// Koneksi database
$db = 'pgsql:host=localhost;dbname=expense';
$username = 'postgres';
$password = 'qwerty123';

try {
    $conn = new PDO($db, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Koneksi Berhasil";
} catch (PDOException $e) {
    // echo "Koneksi gagal". $e -> getMessage();
}

file_put_contents('debug.log', 'Request received: ' . date("Y-m-d H:i:s") . PHP_EOL, FILE_APPEND);

?>