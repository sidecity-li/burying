import { Modal, Button } from "antd";

export default function App() {
  return (
    <Modal open={true}>
      <p style={{ border: "1px solid red" }}>
        <Button>hello</Button>
      </p>
    </Modal>
  );
}
