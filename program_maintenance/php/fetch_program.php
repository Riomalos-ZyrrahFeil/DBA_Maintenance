<?php
header("Content-Type: application/json");
include '../../db.php';

// Fetch all programs
$sql = "SELECT program_id, program_code FROM tbl_program";
$result = $conn->query($sql);

$programs = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $programs[] = $row;
    }
}

echo json_encode($programs);
$conn->close();
?>
