<?php
include '../../db.php';
header('Content-Type: application/json');

$result = $conn->query("SELECT section_id, section_code FROM tbl_section ORDER BY section_code ASC");

$sections = [];
while ($row = $result->fetch_assoc()) {
    $sections[] = $row;
}

echo json_encode($sections);
?>
