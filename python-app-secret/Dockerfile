FROM oraclelinux:8.7
LABEL name="wallys"
RUN yum install python3 -y
WORKDIR /bmo/wallys/
# creating and changing directory
COPY myapp.py .
RUN useradd wallys
USER wallys
CMD [ "python3","myapp.py"]