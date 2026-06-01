<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ContactController extends CI_Controller {
    private ContactModel $model;

    public function __construct() {
        parent::__construct();
        require_once APPPATH . 'models/ContactModel.php';
        $this->model = new ContactModel();
    }

    // GET /contacts
    public function index(): void {
        $contacts = $this->model->findAll();
        // Append full image URL
        foreach ($contacts as &$c) {
            if ($c['image']) {
                $c['image_url'] = UPLOAD_URL . $c['image'];
            } else {
                $c['image_url'] = null;
            }
        }
        $this->json(['success' => true, 'data' => $contacts]);
    }

    // GET /contacts/{id}
    public function show(int $id): void {
        $contact = $this->model->findById($id);
        if (!$contact) {
            $this->json(['success' => false, 'message' => 'Contact not found'], 404);
            return;
        }
        if ($contact['image']) {
            $contact['image_url'] = UPLOAD_URL . $contact['image'];
        }
        $this->json(['success' => true, 'data' => $contact]);
    }

    // POST /contacts
    public function store(): void {
        $data = $this->parseInput();
        $errors = $this->validate($data);

        // Handle image upload
        $imageName = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $result = $this->handleImageUpload($_FILES['image']);
            if (isset($result['error'])) {
                $errors['image'] = $result['error'];
            } else {
                $imageName = $result['filename'];
            }
        } else {
            $errors['image'] = 'Image is required';
        }

        if (!empty($errors)) {
            $this->json(['success' => false, 'errors' => $errors], 422);
            return;
        }

        // Check duplicate email
        if ($this->model->findByEmail($data['email'])) {
            $this->json(['success' => false, 'errors' => ['email' => 'Email already exists']], 422);
            return;
        }

        $id = $this->model->create([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'phone'   => $data['phone'],
            'image'   => $imageName,
            'dob'     => $data['dob'],
            'message' => $data['message'],
        ]);

        $contact = $this->model->findById($id);
        if ($contact['image']) $contact['image_url'] = UPLOAD_URL . $contact['image'];

        $this->json(['success' => true, 'message' => 'Contact created successfully', 'data' => $contact], 201);
    }

    // PUT /contacts/{id}
    public function update(int $id): void {
        $contact = $this->model->findById($id);
        if (!$contact) {
            $this->json(['success' => false, 'message' => 'Contact not found'], 404);
            return;
        }

        // Parse multipart form data for PUT
        $data = $_POST;
        if (empty($data)) {
            // Try to parse raw body
            parse_str(file_get_contents('php://input'), $data);
        }

        $errors = $this->validate($data, false);

        $imageName = $contact['image']; // keep existing
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $result = $this->handleImageUpload($_FILES['image']);
            if (isset($result['error'])) {
                $errors['image'] = $result['error'];
            } else {
                // Delete old image
                if ($contact['image'] && file_exists(UPLOAD_DIR . $contact['image'])) {
                    unlink(UPLOAD_DIR . $contact['image']);
                }
                $imageName = $result['filename'];
            }
        }

        if (!empty($errors)) {
            $this->json(['success' => false, 'errors' => $errors], 422);
            return;
        }

        // Check duplicate email (excluding current record)
        if ($this->model->findByEmail($data['email'], $id)) {
            $this->json(['success' => false, 'errors' => ['email' => 'Email already used by another contact']], 422);
            return;
        }

        $this->model->update($id, [
            'name'    => $data['name'],
            'email'   => $data['email'],
            'phone'   => $data['phone'],
            'image'   => $imageName,
            'dob'     => $data['dob'],
            'message' => $data['message'],
        ]);

        $updated = $this->model->findById($id);
        if ($updated['image']) $updated['image_url'] = UPLOAD_URL . $updated['image'];

        $this->json(['success' => true, 'message' => 'Contact updated successfully', 'data' => $updated]);
    }

    // DELETE /contacts/{id}
    public function destroy(int $id): void {
        $contact = $this->model->findById($id);
        if (!$contact) {
            $this->json(['success' => false, 'message' => 'Contact not found'], 404);
            return;
        }

        // Delete image file
        if ($contact['image'] && file_exists(UPLOAD_DIR . $contact['image'])) {
            unlink(UPLOAD_DIR . $contact['image']);
        }

        $this->model->delete($id);
        $this->json(['success' => true, 'message' => 'Contact deleted successfully']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function validate(array $data, bool $requireImage = true): array {
        $errors = [];

        // Name
        if (empty(trim($data['name'] ?? ''))) {
            $errors['name'] = 'Name is required';
        } elseif (strlen($data['name']) < 2 || strlen($data['name']) > 100) {
            $errors['name'] = 'Name must be between 2 and 100 characters';
        } elseif (!preg_match('/^[a-zA-Z\s]+$/', $data['name'])) {
            $errors['name'] = 'Name must contain only letters and spaces';
        }

        // Email
        if (empty(trim($data['email'] ?? ''))) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }

        // Phone
        if (empty(trim($data['phone'] ?? ''))) {
            $errors['phone'] = 'Phone is required';
        } elseif (!preg_match('/^[0-9]{10}$/', preg_replace('/[\s\-\+\(\)]/', '', $data['phone']))) {
            $errors['phone'] = 'Phone must be a valid 10-digit number';
        }

        // Date of Birth
        if (empty(trim($data['dob'] ?? ''))) {
            $errors['dob'] = 'Date of birth is required';
        } else {
            $dob = DateTime::createFromFormat('Y-m-d', $data['dob']);
            if (!$dob) {
                $errors['dob'] = 'Invalid date format';
            } else {
                $now = new DateTime();
                $age = $now->diff($dob)->y;
                if ($dob > $now) {
                    $errors['dob'] = 'Date of birth cannot be in the future';
                } elseif ($age < 1) {
                    $errors['dob'] = 'Age must be at least 1 year';
                } elseif ($age > 120) {
                    $errors['dob'] = 'Invalid date of birth';
                }
            }
        }

        // Message
        if (empty(trim($data['message'] ?? ''))) {
            $errors['message'] = 'Message is required';
        } elseif (strlen($data['message']) < 10) {
            $errors['message'] = 'Message must be at least 10 characters';
        } elseif (strlen($data['message']) > 1000) {
            $errors['message'] = 'Message cannot exceed 1000 characters';
        }

        return $errors;
    }

    private function handleImageUpload(array $file): array {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($file['type'], $allowedTypes)) {
            return ['error' => 'Only JPG, PNG, GIF, WEBP images allowed'];
        }

        if ($file['size'] > $maxSize) {
            return ['error' => 'Image must be less than 5MB'];
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('contact_', true) . '.' . strtolower($ext);
        $destination = UPLOAD_DIR . $filename;

        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return ['error' => 'Failed to upload image'];
        }

        return ['filename' => $filename];
    }

    private function parseInput(): array {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            return $_POST;
        }
        parse_str(file_get_contents('php://input'), $data);
        return $data;
    }

    private function json(array $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        // Use JSON_UNESCAPED_SLASHES to keep URLs readable for the frontend
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }
}
