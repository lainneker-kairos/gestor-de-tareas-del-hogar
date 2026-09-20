from app import app
from database import db
from models.user import User

def run_tests():
    with app.app_context():
        print("Testing user password hashing & check...")
        test_user = User.query.filter_by(username='test_pwd_user').first()
        if not test_user:
            test_user = User(username='test_pwd_user', email='test_pwd@example.com', role='member')
            test_user.set_password('old_password123')
            db.session.add(test_user)
            db.session.commit()
            print("Created test user.")

        assert test_user.check_password('old_password123') is True
        print("Old password check: PASSED")

        client = app.test_client()

        # 1. Login to get token
        login_res = client.post('/api/auth/login', json={
            'username': 'test_pwd_user',
            'password': 'old_password123'
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.json}"
        token = login_res.json['access_token']
        print("Login & JWT token retrieval: PASSED")

        headers = {'Authorization': f'Bearer {token}'}

        # 2. Test change password with wrong current password
        err_res = client.put('/api/auth/change-password', json={
            'current_password': 'wrong_password',
            'new_password': 'new_password123'
        }, headers=headers)
        assert err_res.status_code == 400
        assert err_res.json['error'] == 'La contraseña actual es incorrecta.'
        print("Reject wrong current password: PASSED")

        # 3. Test change password with short new password
        short_res = client.put('/api/auth/change-password', json={
            'current_password': 'old_password123',
            'new_password': '123'
        }, headers=headers)
        assert short_res.status_code == 400
        assert 'al menos 6 caracteres' in short_res.json['error']
        print("Reject short new password: PASSED")

        # 4. Test change password successfully
        success_res = client.put('/api/auth/change-password', json={
            'current_password': 'old_password123',
            'new_password': 'new_password123'
        }, headers=headers)
        assert success_res.status_code == 200, f"Change password failed: {success_res.json}"
        print("Change password API: PASSED")

        # 5. Verify login with new password
        new_login = client.post('/api/auth/login', json={
            'username': 'test_pwd_user',
            'password': 'new_password123'
        })
        assert new_login.status_code == 200, "Login with new password failed"
        print("Login with new password: PASSED")

        # Clean up test user
        db.session.delete(test_user)
        db.session.commit()
        print("Cleanup: PASSED")

    print("ALL BACKEND CHANGE PASSWORD TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
