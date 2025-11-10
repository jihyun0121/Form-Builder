package form.backend.service;

import form.backend.dto.UserDTO;
import form.backend.entity.User;
import form.backend.repository.UserRepository;
import form.backend.security.JWToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JWToken jwtoken;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository, JWToken jwtoken) {
        this.userRepository = userRepository;
        this.jwtoken = jwtoken;
    }

    public User signup(UserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();

        return userRepository.save(user);
    }

    public Map<String, Object> login(UserDTO dto) {
        Optional<User> optionalUser = userRepository.findByEmail(dto.getEmail());
        if (optionalUser.isEmpty())
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");

        User user = optionalUser.get();

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        String token = jwtoken.createToken(user.getUserId());

        return Map.of(
                "message", "로그인 성공",
                "token", token,
                "user_id", user.getUserId(),
                "email", user.getEmail()
        );
    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
