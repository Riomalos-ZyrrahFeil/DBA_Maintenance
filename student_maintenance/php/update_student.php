<?php
header("Content-Type: text/plain");
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo "No data received.";
    exit;
}

$id = $data['student_id'];
$name = $data['student_name'];
$email = $data['email'];
$gender = $data['gender'];
$birthdate = $data['birthdate'];
$year_level = $data['year_level'];
$program_id = $data['program_id'];

$sql = "UPDATE tbl_student 
        SET student_name = ?, email = ?, gender = ?, birthdate = ?, year_level = ?, program_id = ? 
        WHERE student_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $name, $email, $gender, $birthdate, $year_level, $program_id, $id);

if ($stmt->execute()) {
    echo "✅ Student updated successfully!";
} else {
    echo "❌ Update failed: " . $conn->error;
}

$stmt->close();
$conn->close();
?>
