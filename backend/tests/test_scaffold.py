import app


def test_backend_package_is_importable() -> None:
    assert app.__doc__
