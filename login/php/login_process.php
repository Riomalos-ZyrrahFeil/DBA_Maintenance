<?php
session_start();
require_once('../../db.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $selected_role = $_POST['role']; 

    $stmt = $conn->prepare("SELECT user_id, password, role, reference_id FROM tbl_user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        $is_super_admin_as_faculty = ($user['role'] === 'super_admin' && $selected_role === 'faculty');
        
        if ($user['role'] !== $selected_role && !$is_super_admin_as_faculty) {
            echo "<script>
                    alert('This account is registered as a " . ucwords(str_replace('_', ' ', $user['role'])) . ", not " . $selected_role . ".');
                    window.location.href = '../../index.php';
                  </script>";
            exit();
        }

        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['ref_id'] = $user['reference_id'];
            
            if ($user['role'] === 'student') {
                $_SESSION['student_id'] = $user['reference_id'];
            }

            header("Location: ../../dashboard.php");
            exit();
        } else {
            echo "<script>
                    alert('Incorrect password. Please try again.');
                    window.location.href = '../../index.php';
                  </script>";
            exit();
        }
    } else {
        echo "<script>
                alert('No account found with that email address.');
                window.location.href = '../../index.php';
              </script>";
        exit();
    }
}
?>