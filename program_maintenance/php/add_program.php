<?php

ini_set('display_errors', 1);
ini_set('html_errors', 0); // Stops the output of <br /><b>...
error_reporting(E_ALL);

include '../../db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$code = $data['program_code'];
$name = $data['program_name'];
$dept = $data['dept_id'];

$sql = "INSERT INTO tbl_program (program_code, program_name, dept_id) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $code, $name, $dept);

if ($stmt->execute()) {
  echo json_encode(["message" => "Program added successfully!"]);
} else {
  echo json_encode(["message" => "Failed to add program."]);
}

$stmt->close();
$conn->close();
?>
