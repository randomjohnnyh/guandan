cd ../client
npm run-script build
cd ..
rm -rf server/static
cp -R client/build server/static
cd server
yarn start