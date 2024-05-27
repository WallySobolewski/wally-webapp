FROM nginx
LABEL name="WallyS"
LABEL email="wally.sobolewski@mail.com"
# labels are optional
COPY . /usr/share/nginx/html/