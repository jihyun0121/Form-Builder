package form.backend.enums;

import java.util.*;

public enum QuestionType {
    SHORT_TEXT {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "text");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("text", "");
        }
    },
    LONG_TEXT {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "text");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("text", "");
        }
    },
    RADIO {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "selected_option");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("selected_option", null);
        }
    },
    CHECKBOX {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "selected_options");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("selected_options", new ArrayList<>());
        }
    },
    DROPDOWN {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "selected_option");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("selected_option", null);
        }
    },
    SCALE {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireOneOfKeys(data, "score", "value");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("score", 0);
        }
    },
    MATRIX_RADIO {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "answers");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("answers", new LinkedHashMap<String, String>());
        }
    },
    MATRIX_CHECKBOX {
        @Override
        public void validateAnswer(Map<String, Object> data) {
            requireKey(data, "answers");
        }

        @Override
        public Map<String, Object> getDefaultAnswerTemplate() {
            return Map.of("answers", new LinkedHashMap<String, List<String>>());
        }
    };

    public abstract void validateAnswer(Map<String, Object> data);

    public abstract Map<String, Object> getDefaultAnswerTemplate();

    protected void requireKey(Map<String, Object> data, String key) {
        if (data == null || !data.containsKey(key)) {
            throw new IllegalArgumentException(
                    this.name() + " 유형의 답변에는 '" + key + "' 키가 필요합니다.");
        }
    }

    protected void requireOneOfKeys(Map<String, Object> data, String... keys) {
        if (data == null) {
            throw new IllegalArgumentException(this.name() + " 데이터가 비어 있습니다.");
        }
        boolean ok = false;
        for (String key : keys) {
            if (data.containsKey(key)) {
                ok = true;
                break;
            }
        }
        if (!ok) {
            throw new IllegalArgumentException(
                    this.name() + " 유형의 답변에는 다음 중 하나가 필요합니다: " + String.join(", ", keys));
        }
    }
}
