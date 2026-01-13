<?php
session_start();
include '../../db.php'; 

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'super_admin') {
    die("Unauthorized access.");
}

date_default_timezone_set('Asia/Manila');

$tables = array();
$result = $conn->query("SHOW TABLES");
while ($row = $result->fetch_row()) {
    $tables[] = $row[0];
}

$sql_content = "-- DBA MAINTENANCE SYSTEM BACKUP\n";
$sql_content .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
$sql_content .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

foreach ($tables as $table) {
    $sql_content .= "DROP TABLE IF EXISTS `$table`;\n";

    $res = $conn->query("SHOW CREATE TABLE `$table` ");
    $row = $res->fetch_row();
    $sql_content .= $row[1] . ";\n\n";

    $res = $conn->query("SELECT * FROM `$table` ");
    while ($row = $res->fetch_assoc()) {
        $sql_content .= "INSERT INTO `$table` VALUES (";
        $values = array_map(function($v) use ($conn) {
            if ($v === null) return 'NULL';
            return "'" . $conn->real_escape_string($v) . "'";
        }, array_values($row));
        $sql_content .= implode(', ', $values) . ");\n";
    }
    $sql_content .= "\n";
}

$sql_content .= "SET FOREIGN_KEY_CHECKS=1;";

$filename = "db_backup_" . date("Y-m-d_H-i-s") . ".sql";
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

echo $sql_content;
exit;