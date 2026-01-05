<?php
include '../../db.php';
session_start();

// Restriction: Only Super Admin can backup
if ($_SESSION['role'] !== 'super_admin') {
  die("Access Denied.");
}

// 1. Identification: Identify tables and system state
$tables = [];
$result = $conn->query("SHOW TABLES");
while ($row = $result->fetch_row()) {
  $tables[] = $row[0];
}

$today = date("Y-m-d H:i:s");
$backup_content = "-- PUP System Backup Identification\n";
$backup_content .= "-- Generated: $today\n";
$backup_content .= "-- Identified Tables: " . implode(", ", $tables) . "\n\n";

// 2. Logic to generate SQL structure and data
foreach ($tables as $table) {
  // Create table structure
  $res = $conn->query("SHOW CREATE TABLE $table");
  $row = $res->fetch_row();
  $backup_content .= "\n\n" . $row[1] . ";\n\n";

  // Identify record count for logging
  $data = $conn->query("SELECT * FROM $table");
  $backup_content .= "-- Records identified in $table: " . $data->num_rows . "\n";

  while ($row = $data->fetch_assoc()) {
    $keys = array_keys($row);
    $values = array_map(function($v) use ($conn) { return "'" . $conn->real_escape_string($v) . "'"; }, array_values($row));
    $backup_content .= "INSERT INTO $table (" . implode(", ", $keys) . ") VALUES (" . implode(", ", $values) . ");\n";
  }
}

// 3. Download the file
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="pup_backup_'.date('Y-m-d').'.sql"');
echo $backup_content;
exit;
?>