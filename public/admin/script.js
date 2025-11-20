document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('userTableBody')) {
        await loadUsers();
    }
    if (document.getElementById('addUserForm')) {
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                if (response.ok) {
                    window.location.href = 'index.html';
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                alert('Error adding user: ' + error.message);
            }
        });
    }
    if (document.getElementById('editUserForm')) {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        
        if (userId) {
            try {
                const response = await fetch(`/users/${userId}`);
                if (response.ok) {
                    const user = await response.json();
                    document.getElementById('userId').value = user._id;
                    document.getElementById('name').value = user.name;
                    document.getElementById('email').value = user.email;
                } else {
                    alert('User not found');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Error loading user: ' + error.message);
            }
        }
        
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('userId').value;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const updateData = { name, email };
            if (password) {
                updateData.password = password;
            }
            
            try {
                const response = await fetch(`/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (response.ok) {
                    window.location.href = 'index.html';
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                alert('Error updating user: ' + error.message);
            }
        });
    }
});

async function loadUsers() {
    try {
        const response = await fetch('/users');
        if (response.ok) {
            const users = await response.json();
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = '';
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <a href="edit-user.html?id=${user._id}">Edit</a>
                        <button onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        } else {
            alert('Error loading users');
        }
    } catch (error) {
        alert('Error loading users: ' + error.message);
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/users/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                window.location.reload();
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            alert('Error deleting user: ' + error.message);
        }
    }
}

