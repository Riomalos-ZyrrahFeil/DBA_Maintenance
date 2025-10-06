<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=programs.xls");

echo "Program ID\tProgram Code\tProgram Name\tDepartment\n";

$sql = "SELECT p.program_id, p.program_code, p.program_name, d.dept_name 
        FROM tbl_program p
        JOIN tbl_department d ON p.dept_id = d.dept_id";
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
  echo "{$row['program_id']}\t{$row['program_code']}\t{$row['program_name']}\t{$row['dept_name']}\n";
}
$conn->close();
?>
