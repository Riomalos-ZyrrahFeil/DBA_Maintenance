<?php
include 'db.php'; 

$default_password = "PUP_Password123";
$hashed_password = password_hash($default_password, PASSWORD_DEFAULT);

echo "<h2>Starting Account Seeding...</h2>";

$students = $conn->query("SELECT student_id, student_no, email FROM tbl_student WHERE is_deleted = 0");
$s_count = 0;

while ($row = $students->fetch_assoc()) {
    $sid = $row['student_id'];
    $s_no = $row['student_no'];
    $email = !empty($row['email']) ? $row['email'] : "student_" . $sid . "@pup.edu.ph"; 

    $check = $conn->query("SELECT user_id FROM tbl_user WHERE username = '$s_no'");
    if ($check->num_rows == 0) {
        $sql = "INSERT INTO tbl_user (email, username, password, role, reference_id, is_first_login) 
                VALUES (?, ?, ?, 'student', ?, 1)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $email, $s_no, $hashed_password, $sid);
        $stmt->execute();
        $s_count++;
    }
}
echo "Successfully created $s_count student accounts.<br>";

$instructors = $conn->query("SELECT instructor_id, email FROM tbl_instructor WHERE is_deleted = 0");
$i_count = 0;

while ($row = $instructors->fetch_assoc()) {
    $iid = $row['instructor_id'];
    $email = $row['email']; 

    if (empty($email)) continue; 

    $check = $conn->query("SELECT user_id FROM tbl_user WHERE email = '$email'");
    if ($check->num_rows == 0) {
        $sql = "INSERT INTO tbl_user (email, username, password, role, reference_id, is_first_login) 
                VALUES (?, ?, ?, 'faculty', ?, 1)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $email, $email, $hashed_password, $iid);
        $stmt->execute();
        $i_count++;
    }
}
echo "<strong>Seeding Complete.</strong><br>";
echo "Default Password: <code>$default_password</code><br>";
echo "Students use: Student Number OR Email to log in.";
?>