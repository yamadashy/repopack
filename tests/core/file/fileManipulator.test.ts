import { describe, expect, test } from 'vitest';
import { getFileManipulator } from '../../../src/core/file/fileManipulator.js';

describe('fileManipulator', () => {
  const testCases = [
    {
      name: 'C comment removal',
      ext: '.c',
      input: `
        // Single line comment
        int main() {
          /* Multi-line
             comment */
          return 0;
        }
      `,
      expected: `

        int main() {


          return 0;
        }
`,
    },
    {
      name: 'C# comment removal',
      ext: '.cs',
      input: `
        // Single line comment
        public class Test {
          /* Multi-line
             comment */
          public void Method() {}
        }
      `,
      expected: `

        public class Test {


          public void Method() {}
        }
`,
    },
    {
      name: 'CSS comment removal',
      ext: '.css',
      input: `
        /* Comment */
        body {
          color: red; /* Inline comment */
        }
      `,
      expected: `

        body {
          color: red;
        }
`,
    },
    {
      name: 'HTML comment removal',
      ext: '.html',
      input: '<div><!-- Comment -->Content</div>',
      expected: '<div>Content</div>',
    },
    {
      name: 'Java comment removal',
      ext: '.java',
      input: `
        // Single line comment
        public class Test {
          /* Multi-line
             comment */
          public void method() {}
        }
      `,
      expected: `

        public class Test {


          public void method() {}
        }
`,
    },
    {
      name: 'JavaScript comment removal',
      ext: '.js',
      input: `
        // Single line comment
        function test() {
          /* Multi-line
             comment */
          return true;
        }
      `,
      expected: `

        function test() {


          return true;
        }
`,
    },
    {
      name: 'Less comment removal',
      ext: '.less',
      input: `
        // Single line comment
        @variable: #888;
        /* Multi-line
           comment */
        body { color: @variable; }
      `,
      expected: `

        @variable: #888;


        body { color: @variable; }
`,
    },
    {
      name: 'PHP comment removal',
      ext: '.php',
      input: `
        <?php
        // Single line comment
        # Another single line comment
        function test() {
          /* Multi-line
             comment */
          return true;
        }
        ?>
      `,
      expected: `
        <?php


        function test() {


          return true;
        }
        ?>
`,
    },
    {
      name: 'Python comment removal',
      ext: '.py',
      input: `
        # Single line comment
        def test():
          '''
          docstring
          '''
          return True
        """
        Another docstring
        """
      `,
      expected: `

        def test():
          '''
          docstring
          '''
          return True
        """
        Another docstring
        """
`,
    },
    {
      name: 'Python comment, docstring removal',
      ext: '.py',
      input: `
        # Single line comment
        def test():
          '''
          docstring
          '''
          return True
        """
        Another docstring
        """
      `,
      expected: `

        def test():

          return True

`,
    },
    {
      name: 'Python comment f-string is not removed',
      ext: '.py',
      input: `
        # Single line comment
        def test():
          f'f-string'
          f"""
          f-string
          """
          return True
      `,
      expected: `

        def test():
          f'f-string'
          f"""
          f-string
          """
          return True
`,
    },
    {
      name: 'Python comment multi-line string literal is not removed',
      ext: '.py',
      input: `
        def test():
          hoge = """
          multi-line
          string
          """
          return True
      `,
      expected: `

        def test():
          hoge = """
          multi-line
          string
          """
          return True
`,
    },
    {
      name: 'Ruby comment removal',
      ext: '.rb',
      input: `
        # Single line comment
        def test
          =begin
          Multi-line comment
          =end
          true
        end
      `,
      expected: `

        def test



          true
        end
`,
    },
    {
      name: 'Sass comment removal',
      ext: '.sass',
      input: `
        // Single line comment
        $variable: #888
        /* Multi-line
           comment */
        body
          color: $variable
      `,
      expected: `

        $variable: #888


        body
          color: $variable
`,
    },
    {
      name: 'SCSS comment removal',
      ext: '.scss',
      input: `
        // Single line comment
        $variable: #888;
        /* Multi-line
           comment */
        body { color: $variable; }
      `,
      expected: `

        $variable: #888;


        body { color: $variable; }
`,
    },
    {
      name: 'SQL comment removal',
      ext: '.sql',
      input: `
        -- Single line comment
        SELECT * FROM table WHERE id = 1;
      `,
      expected: `

        SELECT * FROM table WHERE id = 1;
`,
    },
    {
      name: 'Swift comment removal',
      ext: '.swift',
      input: `
        // Single line comment
        func test() {
          /* Multi-line
             comment */
          return true
        }
      `,
      expected: `

        func test() {


          return true
        }
`,
    },
    {
      name: 'TypeScript comment removal',
      ext: '.ts',
      input: `
        // Single line comment
        function test(): boolean {
          /* Multi-line
             comment */
          return true;
        }
      `,
      expected: `

        function test(): boolean {


          return true;
        }
`,
    },
    {
      name: 'XML comment removal',
      ext: '.xml',
      input: '<root><!-- Comment --><element>Content</element></root>',
      expected: '<root><element>Content</element></root>',
    },
    {
      name: 'Dart comment removal',
      ext: '.dart',
      input: `
        // Single line comment
        void main() {
          /* Multi-line
             comment */
          print('Hello');
        }
      `,
      expected: `

        void main() {


          print('Hello');
        }
`,
    },
    {
      name: 'Go comment removal',
      ext: '.go',
      input: `
        // Single line comment
        func main() {
          /* Multi-line
             comment */
          fmt.Println("Hello")
        }
      `,
      expected: `

        func main() {


          fmt.Println("Hello")
        }
`,
    },
    {
      name: 'Kotlin comment removal',
      ext: '.kt',
      input: `
        // Single line comment
        fun main() {
          /* Multi-line
             comment */
          println("Hello")
        }
      `,
      expected: `

        fun main() {


          println("Hello")
        }
`,
    },
    {
      name: 'Rust comment removal',
      ext: '.rs',
      input: `
        // Single line comment
        fn main() {
          /* Multi-line
             comment */
          println!("Hello");
        }
      `,
      expected: `

        fn main() {


          println!("Hello");
        }
`,
    },
    {
      name: 'Shell script comment removal',
      ext: '.sh',
      input: `
        # Single line comment
        echo "Hello"
      `,
      expected: `

        echo "Hello"
`,
    },
    {
      name: 'YAML comment removal',
      ext: '.yml',
      input: `
        key: value  # Comment
        another_key: another_value
      `,
      expected: `
        key: value
        another_key: another_value
`,
    },
    {
      name: 'Vue file comment removal',
      ext: '.vue',
      input: `
        <template>
          <!-- HTML comment -->
          <div>{{ message }}</div>
        </template>
        <script>
        // JavaScript comment
        export default {
          data() {
            return {
              message: 'Hello'
            }
          }
        }
        </script>
        <style>
        /* CSS comment */
        .test { color: red; }
        </style>
      `,
      expected: `
        <template>

          <div>{{ message }}</div>
        </template>
        <script>

        export default {
          data() {
            return {
              message: 'Hello'
            }
          }
        }
        </script>
        <style>

        .test { color: red; }
        </style>
`,
    },
    {
      name: 'Svelte file comment removal',
      ext: '.svelte',
      input: `
        <!-- HTML comment -->
        <div>{message}</div>
        <script>
        // JavaScript comment
        let message = 'Hello';
        </script>
        <style>
        /* CSS comment */
        div { color: red; }
        </style>
      `,
      expected: `

        <div>{message}</div>
        <script>

        let message = 'Hello';
        </script>
        <style>

        div { color: red; }
        </style>
`,
    },
  ];

  for (const { name, ext, input, expected } of testCases) {
    test(name, () => {
      const manipulator = getFileManipulator(`test${ext}`);
      expect(manipulator?.removeComments(input)).toBe(expected);
    });
  }

  test('Unsupported file type', () => {
    const manipulator = getFileManipulator('test.unsupported');
    expect(manipulator).toBeNull();
  });
});
