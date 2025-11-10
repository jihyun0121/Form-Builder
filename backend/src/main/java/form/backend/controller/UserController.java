package form.backend.controller;

import form.backend.dto.UserDTO;
import form.backend.entity.User;
import form.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserDTO dto) {
        try {
            User newUser = userService.signup(dto);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "회원가입 성공", "user", newUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }
}
