import { Modal, Button } from "@arco-design/web-react";

export default function App() {
  return (
    <Modal visible={true} title={<div>对话框标题</div>}>
      <p style={{ border: "1px solid red" }}>
        444
        <Button>hello</Button>
      </p>
    </Modal>
  );
}
