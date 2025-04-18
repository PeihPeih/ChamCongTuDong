import styles from "./LoginPage.module.css";

interface InputFieldProps {
    type: string;
    name: string;
    placeholder: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    type,
    name,
    placeholder,
    required = false,
    value,
    onChange,
}) => {
    return (
        <div className={styles.inputContainer}>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                className={styles.input}
                value={value}
                onChange={onChange}
                aria-required={required}
            />
            {required && (
                <span className={styles.requiredIndicator} aria-hidden="true">
                    *
                </span>
            )}
        </div>
    );
};

export default InputField;
