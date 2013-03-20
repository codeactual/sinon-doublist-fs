dsinon-doublistt: components index.js
	@component build --standalone sinonDoublistFs --name sinon-doublist-fs

build: components index.js
	@component install --dev
	@component build --standalone sinonDoublistFs --name build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build

.PHONY: clean
