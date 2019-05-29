.PHONY: serv clean
.SECONDARY:

serv: clean
	hugo server

clean:
	rm -rf resources public
