<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=sections.xls");

$sql = "SELECT * FROM tbl_section";
$result = $conn->query($sql);

echo "Section ID\tCourse ID\tTerm ID\tInstructor ID\tRoom ID\tSection Code\tYear\tDay Pattern\tStart Time\tEnd Time\tMax Capacity\n";

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo implode("\t", $row) . "\n";
    }
}

$conn->close();
?>
