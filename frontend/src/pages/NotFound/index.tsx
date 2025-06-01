import { Container } from "react-bootstrap";
import { palette } from "../../config";

export const NotFoundPage: React.FC = () => {
  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center">
      <div>
        <h1>
          <strong
            style={{
              color: palette.primary,
            }}
          >
            Not Found
          </strong>
        </h1>

        <h2 className="mt-2 text-secondary">
          Il contenuto che cerchi non esiste
        </h2>
      </div>
    </Container>
  );
};
