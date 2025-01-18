import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { Storage } from "aws-amplify";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { signOut } = useAuthenticator();
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  // Subscribe to Todo model changes
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create a new Todo
  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  }

  // Delete a Todo
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // Handle file upload
  async function handleFileUpload() {
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    try {
      const result = await Storage.put(file.name, file, {
        contentType: file.type, // Specify MIME type
      });
      setUploadMessage(`File uploaded successfully: ${result.key}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file. Please try again.");
    }
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={signOut}>Sign out</button>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
            {todo.content}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>

      {/* File Upload Section */}
      <h2>Upload a File</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button onClick={handleFileUpload}>Upload</button>
      {uploadMessage && <p>{uploadMessage}</p>}
    </main>
  );
}

export default App;
