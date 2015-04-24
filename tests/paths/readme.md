## How to add new test file

Lets assume you have test file called `test.svg`.

 1. Ensure that it has dimensions 100 × 100. If some particular bug needs bigger dimensions, use `viewBox` attribute to squeeze it into 100 × 100.
 2. Copy file into `data` subfolder.
 3. Install svgo by running `[sudo] npm install -g svgo`.
 4. Copy file into `svgo` subfolder.
 5. Run command `svgo svgo/test.svg`.
 6. Run generator `node generate`.
 7. Open `index.html` and enjoy the tests.

If you need to test one file:

 1. Copy file into this folder.
 2. Run the generate script with file name as a parameter: `node generate test.svg`
 3. Generated file will be saved as `test.svg.html`.
