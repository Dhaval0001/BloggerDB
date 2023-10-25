if __name__ == '__main__':
    import uvicorn

    uvicorn.run("controller.controller:app", reload=True)
