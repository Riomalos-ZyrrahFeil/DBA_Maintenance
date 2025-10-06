<?php
header("Content-Type: application/json");
include '../../db.php';

$search = isset($_GET['search']) ? "%{$_GET['search']}%" : "%";

$sql = "SELECT p.program_id, p.program_code, p.program_name, p.dept_id, d.dept_name 
        FROM tbl_program p
        JOIN tbl_department d ON p.dept_id = d.dept_id
        WHERE p.program_code LIKE ? OR p.program_name LIKE ? OR d.dept_name LIKE ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $search, $search, $search);
$stmt->execute();
$result = $stmt->get_result();

$programs = [];
while ($row = $result->fetch_assoc()) {
  $programs[] = $row;
}

echo json_encode($programs);
$stmt->close();
$conn->close();
?>
