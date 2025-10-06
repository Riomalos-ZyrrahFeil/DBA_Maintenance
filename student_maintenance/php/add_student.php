<?php
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$sql = "INSERT INTO tbl_student (student_name, email, gender, birthdate, year_level, program_id)
        VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $data['student_name'], $data['email'], $data['gender'], $data['birthdate'], $data['year_level'], $data['program_id']);

echo $stmt->execute() ? "Student added!" : "Error adding student.";
?>
