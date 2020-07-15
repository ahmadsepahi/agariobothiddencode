build:
	python setup.py sdist

upload:
	twine upload dist/*

deploy:
	make build
	make upload

clean:
	rm -rf dist
	rm -rf agario_bot.egg-info